import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Breadcrumb } from '../components/common';

function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Privacy Policy', path: '/privacy' }]} />

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Privacy Policy
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2, color: 'text.secondary' } }}>
          <Typography variant="body1">
            At Uyirgene International Food-Safety-Training, we are committed to safeguarding and preserving the privacy of our visitors. This Privacy Policy explains what happens to any personal data that you provide to us, or that we collect from you whilst you visit our site.
          </Typography>
          <Typography variant="body1">
            We do update this Policy from time to time so please do review this Policy regularly.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Information We Collect
          </Typography>
          <Typography variant="body1">
            In running and maintaining our website we may collect and process the following data about you:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>Information about your use of our site including details of your visits such as pages viewed and the resources that you access. Such information includes traffic data, location data and other communication data.</li>
            <li>Information provided voluntarily by you. For example, when you register for information or make a purchase.</li>
            <li>Information that you provide when you communicate with us by any means.</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Use of Cookies
          </Typography>
          <Typography variant="body1">
            Cookies provide information regarding the computer used by a visitor. We may use cookies where appropriate to gather information about your computer in order to assist us in improving our website.
          </Typography>
          <Typography variant="body1">
            We may gather information about your general internet use by using the cookie. Where used, these cookies are downloaded to your computer and stored on the computer's hard drive. Such information will not identify you personally. It is statistical data. This statistical data does not identify any personal details whatsoever.
          </Typography>
          <Typography variant="body1">
            You can adjust the settings on your computer to decline any cookies if you wish. This can easily be done by activating the reject cookies setting on your computer.
          </Typography>
          <Typography variant="body1">
            Our advertisers may also use cookies, over which we have no control. Such cookies (if used) would be downloaded once you click on advertisements on our website.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Use of Your Information
          </Typography>
          <Typography variant="body1">
            We use the information that we collect from you to provide our services to you. In addition to this we may use the information for one or more of the following purposes:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>To provide information to you that you request from us relating to our products or services.</li>
            <li>To provide information to you relating to other products that may be of interest to you. Such additional information will only be provided where you have consented to receive such information.</li>
            <li>To inform you of any changes to our website, services or goods and products.</li>
          </Box>
          <Typography variant="body1">
            If you have previously purchased goods or services from us we may provide to you details of similar goods or services, or other goods and services, that you may be interested in.
          </Typography>
          <Typography variant="body1">
            Where your consent has been provided in advance we may allow selected third parties to use your data to enable them to provide you with information regarding unrelated goods and services which we believe may interest you. Where such consent has been provided it can be withdrawn by you at any time.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Registration Information
          </Typography>
          <Typography variant="body1">
            In order to use certain features of the Services, such as registering for a Course, you are required to register for an Account, and in that case, we will collect and store any registration information You provided to Us, such as e-mail address, password, your date of birth, and age, and we will assign You a unique identifying number ("Registration Information").
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Profile Information
          </Typography>
          <Typography variant="body1">
            You may also have the option of providing additional information about Yourself, including but not limited to a photo, headline, website link, social media profiles, or other information you may choose to enter ("Profile Information") to create a profile ("Profile"). Your Profile and Profile Information will be publicly viewable to others.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Course Information
          </Typography>
          <Typography variant="body1">
            U-Tech allows You to enroll in and take online Courses on a variety of topics which are taught by Publishers where, among other things, you will see reviews for Courses by others. We collect information relating to taking Courses, including, without limitation, topic, course and assessment completion activity and other items submitted to satisfy the Course requirements ("Course Information").
          </Typography>
          <Typography variant="body1">
            You hereby consent to Our sharing of Registration Information (except for your email address), Profile Information, and Course Information to Publishers. U-Tech does not provide Students email addresses to Publishers. U-Tech does not control how Publishers treat Registration Information, Profile Information, or Course Information and is not liable for Publishers' use of such information.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Payment Information
          </Typography>
          <Typography variant="body1">
            If You make any purchases through our Services, such as for Certificates, we may collect certain information regarding Your purchase (such as Your name and address) as necessary to process Your order. You will be required to provide certain payment and billing information directly to our payment processing partners, including but not limited to Your name, credit card information. We do not access, store or collect Your credit card information.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Storing Your Personal Data
          </Typography>
          <Typography variant="body1">
            In operating our website it may become necessary to transfer data that we collect from you to locations outside of the European Union for processing and storing. By providing your personal data to us, you agree to this transfer, storing or processing. We do our utmost to ensure that all reasonable steps are taken to make sure that your data is treated stored securely.
          </Typography>
          <Typography variant="body1">
            Unfortunately the sending of information via the internet is not totally secure and on occasion such information can be intercepted. We cannot guarantee the security of data that you choose to send us electronically, sending such information is entirely at your own risk.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Disclosing Your Information
          </Typography>
          <Typography variant="body1">
            We will not disclose your personal information to any other party other than in accordance with this Privacy Policy and in the circumstances detailed below:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>In the event that we sell any or all of our business to the buyer.</li>
            <li>Where we are legally required by law to disclose your personal information.</li>
            <li>To further fraud protection and reduce the risk of fraud.</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Third Party Links
          </Typography>
          <Typography variant="body1">
            On occasion we include links to third parties on this website. Where we provide a link it does not mean that we endorse or approve that site's policy towards visitor privacy. You should review their privacy policy before sending them any personal data.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Contact Us
          </Typography>
          <Typography variant="body1">
            Uyir-Tech International Testing Laboratory, Research and Training Institute
          </Typography>
          <Typography variant="body1">
            Bharathi Nagar, NGO Colony, Sattur, Tamil Nadu, India
          </Typography>
          <Typography variant="body1">
            Please do not hesitate to contact us regarding any matter relating to this Privacy Policy at www.uyirgene.com
          </Typography>
          <Typography variant="body1">
            Mail: admin@uyirgene.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Privacy;
