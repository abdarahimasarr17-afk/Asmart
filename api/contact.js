module.exports = async (req, res) => {
  // Check request method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, phone, email, metier, zone, message, 'selected-timeslot': timeslot, honeypot } = req.body || {};

    // Spam check 1: Honeypot field (hidden field)
    // If it is filled, it means a bot submitted it. Return silent success.
    if (honeypot && honeypot.trim() !== '') {
      console.warn('Bot detected via honeypot.');
      return res.status(200).json({ success: true, message: 'Message envoyé avec succès' });
    }

    // Required fields check side server
    if (!name || !name.trim() ||
        !company || !company.trim() ||
        !phone || !phone.trim() ||
        !email || !email.trim() ||
        !metier || !metier.trim() ||
        !zone || !zone.trim()) {
      return res.status(400).json({ error: 'Tous les champs obligatoires (nom, entreprise, téléphone, e-mail, secteur métier, zone géographique) doivent être renseignés.' });
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Le format de l\'adresse e-mail est invalide.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing in environment variables.');
      return res.status(500).json({ error: 'La configuration d\'envoi d\'emails est incomplète sur le serveur (clé d\'API manquante).' });
    }

    // Format the metier/sector
    const sectorLabels = {
      btp: 'BTP & Travaux',
      securite: 'Sécurité privée',
      nettoyage: 'Nettoyage professionnel',
      'sur-mesure': 'Accompagnement sur mesure'
    };
    const cleanMetier = sectorLabels[metier] || metier;

    // Build the email body
    const emailSubject = `Nouveau message de contact de ${name.trim()} (${company.trim()})`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0A1628; border-bottom: 2px solid #D4A843; padding-bottom: 8px;">Nouveau message du site ASMART</h2>
        
        <p><strong>Nom complet :</strong> ${name.trim()}</p>
        <p><strong>Entreprise :</strong> ${company.trim()}</p>
        <p><strong>Téléphone :</strong> <a href="tel:${phone.trim()}">${phone.trim()}</a></p>
        <p><strong>E-mail :</strong> <a href="mailto:${email.trim()}">${email.trim()}</a></p>
        <p><strong>Secteur d'activité :</strong> ${cleanMetier}</p>
        <p><strong>Zone géographique cible :</strong> ${zone.trim()}</p>
        <p><strong>Créneau de rappel téléphonique :</strong> ${timeslot ? timeslot.trim() : 'Non spécifié'}</p>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #D4A843; border-radius: 4px;">
          <h4 style="margin-top: 0; color: #0A1628;">Message :</h4>
          <p style="white-space: pre-wrap; margin-bottom: 0;">${message ? message.trim() : 'Aucun message fourni.'}</p>
        </div>
      </div>
    `;

    // Call Resend API using standard global fetch
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Contact ASMART <onboarding@resend.dev>', // Resend demands from a verified domain or onboarding@resend.dev
        to: ['contact@asmart.fr'],
        reply_to: email.trim(),
        subject: emailSubject,
        html: emailHtml
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Error from Resend API:', resendData);
      return res.status(resendResponse.status || 500).json({ 
        error: resendData.message || 'Erreur lors de l\'envoi de l\'e-mail via Resend.' 
      });
    }

    return res.status(200).json({ success: true, id: resendData.id });
  } catch (err) {
    console.error('Internal server error in API route:', err);
    return res.status(500).json({ error: 'Une erreur interne est survenue sur le serveur.' });
  }
};
