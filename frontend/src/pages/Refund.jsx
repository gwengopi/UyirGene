import React from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { Breadcrumb } from '../components/common';

function Refund() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Return & Refund Policy', path: '/refund' }]} />

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Return and Refund Policy
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2, color: 'text.secondary' } }}>
          <Typography variant="body1">
            Thank you for buying our courses. We ensure that our users have a rewarding experience while they discover, assess, and purchase our courses, whether it is instructor-led or self-paced training.
          </Typography>
          <Typography variant="body1">
            As with any online purchase experience, there are terms and conditions that govern the Refund Policy. When you buy a training course on Uyir Tech International, you agree to our Privacy Policy, Terms of Use, and refund policy.
          </Typography>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Cancellation & Refunds: Online Training
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>100% amount will be refunded if our online programs are cancelled or postponed.</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Cancellation & Refunds: Self-Paced Learning
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>No refund will be done for Self-Paced courses.</li>
            <li>No refund will be provided and access will be revoked, if anytime found course is been shared with others / multiple users or the intention of the course purchase is to copy the material/Content, and account will be blocked at the same time.</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Cancellation & Refunds: Online Classroom Learning
          </Typography>
          <Typography variant="body1">
            Uyir Tech International reserves the right to postpone/cancel an event because of instructor illness or force-majeure events (like floods, earthquakes, political instability, a pandemic situation like COVID-19, etc.)
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>The refund request will not be accepted if you have attended the online classroom training for more than 1 day's session or have accessed/downloaded course material from the learning portal.</li>
            <li>No refund will be provided on discounted courses.</li>
            <li>No refund will be provided for the academic institute tie-up courses.</li>
            <li>If the delegate does not turn up on the given schedule, then no refund will be provided.</li>
            <li>Raise refund request within 14 days of commencement of the first session. Any refund request beyond 14 days of purchasing the course will not be accepted and no refund will be provided.</li>
            <li>In the case of a refund, taxes amount will not be refunded.</li>
            <li>If the learners want to re-attended the online instructor-led classes for the purchased course and if there's no availability of the batch soon then in that case maximum refund applicable will be 10% of the total amount paid.</li>
            <li>If due to any technical reason learners are not able to access the self-paced videos or class recordings and already attended the complete course through instructor-led online classes then in that case no refund is applicable or can be provided with a voucher for the amount equivalent of the 10% amount paid by the learner at the time of enrolment.</li>
          </Box>

          <Alert severity="info" sx={{ my: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> All refunds will be processed within 20 working days of receipt of the refund request.
            </Typography>
          </Alert>

          <Typography variant="h5" component="h2" fontWeight={600}>
            How to Request a Refund
          </Typography>
          <Typography variant="body1">
            Refund requests can be initiated in the below way:
          </Typography>
          <Box component="ol" sx={{ color: 'text.secondary', pl: 2 }}>
            <li>Write a mail to uyirgene@gmail.com with the title "Refund for my Course [Course Name]"</li>
            <li>Attach your Payment receipt in the mail</li>
          </Box>

          <Typography variant="h5" component="h2" fontWeight={600}>
            Refunds: Duplicate Payment
          </Typography>
          <Typography variant="body1">
            Refund of the duplicate payment made by the delegate will be processed via the same source (original method of payment) in 10 working days post intimation by the customer. Uyir Tech International reserves the right to revise the terms & conditions of this policy without any prior notice.
          </Typography>

          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> All refunds will be processed within 20 working days after the refund request is approved by Uyirgene International.
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
}

export default Refund;
