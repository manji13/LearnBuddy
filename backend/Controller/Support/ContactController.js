const nodemailer = require('nodemailer');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, phone, description } = req.body;

    // Backend Validation
    if (!name || !phone || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Setup Nodemailer transporter (Using existing LearnBuddy Email setup)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Send the email TO your system email, containing the student's details
    const mailOptions = {
      from: process.env.EMAIL_USER, // It must be sent from your authenticated email
      to: process.env.EMAIL_USER,   // Sending it TO yourself (the LearnBuddy System)
      subject: `LearnBuddy Contact Us: New Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">New Contact Submission</h2>
          <p>A student has submitted a new query via the Contact Us page.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          
          <p><strong>Student Name:</strong> ${name}</p>
          <p><strong>Phone Number:</strong> ${phone}</p>
          
          <h4 style="margin-bottom: 5px;">Description:</h4>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #14b8a6; border-radius: 4px;">
            ${description}
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