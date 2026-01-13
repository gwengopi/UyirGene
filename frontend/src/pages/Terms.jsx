import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Breadcrumb } from '../components/common';

function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Terms & Conditions', path: '/terms' }]} />

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Terms & Conditions
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2, color: 'text.secondary' } }}>
          <Typography variant="body1">
            Welcome to www.uyirgene.com!
          </Typography>
          <Typography variant="body1">
            These terms and conditions outline the rules and regulations for the use of Uyirgene International's Website, located at www.uyirgene.com.
          </Typography>
          <Typography variant="body1">
            By accessing this website we assume you accept these terms and conditions. Do not continue to use www.uyirgene.com if you do not agree to take all of the terms and conditions stated on this page.
          </Typography>
          <Typography variant="body1">
            The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice, and all Agreements: "Client", "You" and "Your" refers to you, the person who logs on to this website and is compliant with the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client's needs in respect of the provision of the Company's stated services, in accordance with and subject to, prevailing law of India.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Cookies
          </Typography>
          <Typography variant="body1">
            We employ the use of cookies. By accessing www.uyirgene.com, you agreed to use cookies in agreement with the Uyirgene International's Privacy Policy.
          </Typography>
          <Typography variant="body1">
            Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            License
          </Typography>
          <Typography variant="body1">
            Unless otherwise stated, Uyir Tech International and/or its licensors own the intellectual property rights for all material on www.uyirgene.com. All intellectual property rights are reserved. You may access this from www.uyirgene.com for your own personal use subjected to restrictions set in these terms and conditions.
          </Typography>
          <Typography variant="body1">
            You must not:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>Republish material from www.uyirgene.com</li>
            <li>Sell, rent or sub-license material from www.uyirgene.com</li>
            <li>Reproduce, duplicate or copy material from www.uyirgene.com</li>
            <li>Redistribute content from www.uyirgene.com</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            User Comments
          </Typography>
          <Typography variant="body1">
            Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Uyir Tech International does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Uyir Tech International, its agents and/or affiliates.
          </Typography>
          <Typography variant="body1">
            Uyir Tech International reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
          </Typography>
          <Typography variant="body1">
            You warrant and represent that:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so</li>
            <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party</li>
            <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy</li>
            <li>The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Hyperlinking to our Content
          </Typography>
          <Typography variant="body1">
            The following organizations may link to our Website without prior written approval:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>Government agencies</li>
            <li>Search engines</li>
            <li>News organizations</li>
            <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses</li>
            <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            iFrames
          </Typography>
          <Typography variant="body1">
            Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Content Liability
          </Typography>
          <Typography variant="body1">
            We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Fees Structure
          </Typography>
          <Typography variant="body1">
            Uyirgene International will fix fees structure.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Reservation of Rights
          </Typography>
          <Typography variant="body1">
            We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amend these terms and conditions and its linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Removal of Links from Our Website
          </Typography>
          <Typography variant="body1">
            If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Disclaimer
          </Typography>
          <Typography variant="body1">
            To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>Limit or exclude our or your liability for death or personal injury</li>
            <li>Limit or exclude our or your liability for fraud or fraudulent misrepresentation</li>
            <li>Limit any of our or your liabilities in any way that is not permitted under applicable law</li>
            <li>Exclude any of our or your liabilities that may not be excluded under applicable law</li>
          </Box>
          <Typography variant="body1">
            As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Contact Us
          </Typography>
          <Typography variant="body1">
            Uyirgene International
          </Typography>
          <Typography variant="body1">
            Bharathi Nagar, NGO Colony, Sattur, Tamil Nadu, India
          </Typography>
          <Typography variant="body1">
            Email: admin@uyirgene.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Terms;
