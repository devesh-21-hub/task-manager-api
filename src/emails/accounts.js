const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//sgMail.send(Message);

const sendWelcomeEmail = (email, name) => {
  const Message = {
    to: email,
    from: "deveshkumar21101@gmail.com",
    subject: "Welcome to the app!",
    text: `Hello ${name}! Welcome to the app, we are happy to have you onboard.`,
  };
  sgMail.send(Message);
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "deveshkumar21101@gmail.com",
    subject: "Sorry to see you go",
    text: `Dear ${name} we hope to see you again later`,
  });
};

module.exports = { sendWelcomeEmail, sendCancellationEmail };
/*

//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
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "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";

// Uncomment below two lines to configure authorization using: partner-key
var partnerKey = defaultClient.authentications["partner-key"];
partnerKey.apiKey =
  "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";

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

sendSmtpEmail = {
  to: [
    {
      email: "deveshkumar21101@gmail.com",
      name: "Devesh Kumar",
    },
  ],
  templateId: 1,
  params: {
    name: "John",
    surname: "Doe",
  },
  headers: {
    "X-Mailin-custom":
      "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
  },
};

apiInstance.sendTransacEmail(sendSmtpEmail).then(
  function (data) {
    console.log("API called successfully. Returned data: " + data);
  },
  function (error) {
    console.error(error);
  }
);

*/
