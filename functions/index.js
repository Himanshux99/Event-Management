const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors")({origin: true});

admin.initializeApp();

// Define environment parameters (replaces functions.config())
const { defineString } = require("firebase-functions/params");

const razorpayKeyId = defineString("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineString("RAZORPAY_KEY_SECRET");
const razorpayWebhookSecret = defineString("RAZORPAY_WEBHOOK_SECRET");

// ========================================
// FUNCTION 1: Create Razorpay Route Account for Organizer
// ========================================
exports.createOrganizerAccount = functions.https.onCall(async (request) => {
  const { data, auth } = request;

  // Authentication check
  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const {
    organizerId,
    organizationName,
    accountHolderName,
    accountNumber,
    ifscCode,
    email,
    phone,
  } = data;

  // Validation
  if (!organizerId || !organizationName || !accountNumber || !ifscCode || !email || !phone) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields"
    );
  }

  try {
    // Initialize Razorpay with environment parameters
    const razorpay = new Razorpay({
      key_id: razorpayKeyId.value(),
      key_secret: razorpayKeySecret.value(),
    });

    // Step 1: Create Razorpay Route Account
    const account = await razorpay.accounts.create({
      email: email,
      phone: phone,
      type: "route",
      reference_id: organizerId,
      legal_business_name: organizationName,
      business_type: "ngo",
      contact_name: accountHolderName,
    });

    console.log("Razorpay account created:", account.id);

    // Step 2: Create Stakeholder (required by Razorpay for compliance)
    await razorpay.stakeholders.create(account.id, {
      email: email,
      name: accountHolderName,
      phone: phone,
    });

    console.log("Stakeholder created for account:", account.id);

    // Step 3: Link Bank Account
    await razorpay.accounts.addBankAccount(account.id, {
      ifsc_code: ifscCode,
      account_number: accountNumber,
      beneficiary_name: accountHolderName,
    });

    console.log("Bank account linked:", ifscCode);

    // Step 4: Save to Firestore
    await admin.firestore().collection("organizers").doc(organizerId).set(
      {
        razorpayAccountId: account.id,
        accountDetails: {
          organizationName,
          accountHolderName,
          accountNumber: `****${accountNumber.slice(-4)}`, // Mask account number
          ifscCode,
          email,
          phone,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("Organizer account saved to Firestore");

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error("Error creating organizer account:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to create Razorpay account"
    );
  }
});

// ========================================
// FUNCTION 2: Razorpay Webhook Handler
// ========================================
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature
  const webhookSignature = req.headers["x-razorpay-signature"];
  const webhookBody = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", razorpayWebhookSecret.value())
    .update(webhookBody)
    .digest("hex");

  if (webhookSignature !== expectedSignature) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log("Webhook received:", event);

  try {
    switch (event) {
      case "payment.captured":
        // Update payment status in Firestore
        await admin
          .firestore()
          .collection("payments")
          .doc(payload.payment.entity.order_id)
          .update({
            status: "captured",
            razorpayPaymentId: payload.payment.entity.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        break;

      case "payment.failed":
        // Update payment status
        await admin
          .firestore()
          .collection("payments")
          .doc(payload.payment.entity.order_id)
          .update({
            status: "failed",
            errorCode: payload.payment.entity.error_code,
            errorDescription: payload.payment.entity.error_description,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        break;

      case "transfer.processed":
        // Log successful transfer to organizer
        console.log("Transfer processed:", payload.transfer.entity.id);
        break;

      default:
        console.log("Unhandled event:", event);
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Webhook processing failed");
  }
});

// ========================================
// FUNCTION 3: Create Razorpay Order (HTTPS with CORS)
// ========================================
exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { amount, currency = "INR", eventId, userId } = req.body;

      // Validate required fields
      if (!amount || !eventId || !userId) {
        return res.status(400).json({ error: "Missing required fields: amount, eventId, userId" });
      }

      if (Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      console.log("Creating Razorpay order - event:", eventId, "user:", userId, "amount:", amount);

      const razorpay = new Razorpay({
        key_id: razorpayKeyId.value(),
        key_secret: razorpayKeySecret.value(),
      });

      const amountInPaise = Math.round(Number(amount) * 100);

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1,
      });

      console.log("Razorpay order created:", order.id);

      // Save payment record to Firestore
      await admin.firestore().collection("payments").doc(order.id).set({
        orderId: order.id,
        amount: Number(amount),
        amountInPaise,
        currency,
        eventId,
        userId,
        status: "created",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Payment record saved");

      res.status(200).json({
        success: true,
        orderId: order.id,
        keyId: razorpayKeyId.value(),
        order,
      });
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({
        error: error.message || "Failed to create order",
      });
    }
  });
});