const transporter = require('../../utils/emailTransporter');

exports.submitContactForm = async (req, res) => {
  try {
    // 1. Update the destructured fields to match the frontend
    const { name, email, subject, message } = req.body;

    // 2. Update Backend Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Send the email TO your system email, containing the student's details
    // Use the imported transporter instance (already configured in emailTransporter.js)

    // 3. Update the email HTML to show the new fields
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `LearnBuddy Contact Us: ${subject} from ${name}`, // Added subject here
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">New Contact Submission</h2>
          <p>A student has submitted a new query via the Contact Us page.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          
          <p><strong>Student Name:</strong> ${name}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <h4 style="margin-bottom: 5px;">Message:</h4>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #14b8a6; border-radius: 4px;">
            ${message}
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">This is an automated message from the LearnBuddy System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Contact form submitted successfully.' });

  } catch (error) {
    console.error("CONTACT FORM ERROR: ", error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};