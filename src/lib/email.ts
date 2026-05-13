import { Resend } from "resend";
import { appEnv, hasResend } from "@/lib/env";

function getResendClient() {
  if (!hasResend()) {
    return null;
  }

  return new Resend(appEnv.resendApiKey!);
}

export async function sendReportEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResendClient();

  if (!client) {
    return {
      delivered: false,
      reason: "Resend is not configured in this environment.",
    };
  }

  await client.emails.send({
    from: appEnv.emailFrom!,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return {
    delivered: true,
    reason: null,
  };
}
