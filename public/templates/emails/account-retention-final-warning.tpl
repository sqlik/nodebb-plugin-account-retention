<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="x-apple-disable-message-reformatting">
	<title></title>
	<!--[if mso]>
	<style>
		* { font-family: sans-serif !important; }
	</style>
	<![endif]-->
	<style>
		html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; }
		* { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
		div[style*="margin: 16px 0"] { margin: 0 !important; }
		table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
		table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
		table table table { table-layout: auto; }
		img { -ms-interpolation-mode: bicubic; }
		*[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *, .aBn { border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
		.a6S { display: none !important; opacity: 0.01 !important; }
		img.g-img + div { display: none !important; }
		.button-link { text-decoration: none !important; }
		@media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
			.email-container { min-width: 375px !important; }
		}
	</style>
	<style>
		.button-td, .button-a { transition: all 100ms ease-in; }
		.button-td:hover, .button-a:hover { background: #555555 !important; border-color: #555555 !important; }
		@media screen and (max-width: 600px) {
			.email-container p { font-size: 17px !important; line-height: 26px !important; }
		}
	</style>
	<!--[if gte mso 9]>
	<xml>
		<o:OfficeDocumentSettings>
			<o:AllowPNG/>
			<o:PixelsPerInch>96</o:PixelsPerInch>
		</o:OfficeDocumentSettings>
	</xml>
	<![endif]-->
</head>
<body width="100%" bgcolor="#f6f6f6" style="margin: 0; mso-line-height-rule: exactly;">
	<center style="width: 100%; background: #f6f6f6; text-align: left;">

		<div style="max-width: 600px; margin: auto;{{{ if rtl }}} text-align: right; direction: rtl;{{{ end }}}" class="email-container">
			<!--[if mso]>
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
			<tr>
			<td>
			<![endif]-->

			<!-- Email Header : BEGIN -->
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
				<tr>
					<td style="padding: 20px 0; text-align: center">
						{{{ if logo.src }}}
						<img src="{logo.src}" height="auto" width="{logo.width}" alt="{site_title}" border="0" style="height: auto; width: {logo.width}px; background: #f6f6f6; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 15px; line-height: 20px; color: #333333;">
						{{{ else }}}
						&nbsp;
						{{{ end }}}
					</td>
				</tr>
			</table>
			<!-- Email Header : END -->

			<!-- Email Body : BEGIN -->
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
				<!-- 1 Column Text + Button : BEGIN -->
				<tr>
					<td bgcolor="#ffffff">
						<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
							<tr>
								<td style="padding: 40px 40px 6px 40px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 15px; line-height: 20px; color: #555555;">
									<h1 style="margin: 0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 24px; line-height: 27px; color: #333333; font-weight: normal;">[[email:greeting-no-name]]</h1>
								</td>
							</tr>
							<tr>
								<td style="padding: 0px 40px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 15px; line-height: 20px; color: #555555;">
									<h1 style="margin: 0 0 10px 0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 18px; line-height: 21px; color: #aaaaaa; font-weight: normal;">[[email:account-retention.final-warning.intro, {site_title}, {daysUntilDelete}]]</h1>
									<p style="margin: 12px 0 0 0;">[[email:account-retention.final-warning.body, {daysInactive}]]</p>
								</td>
							</tr>
							<tr>
								<td style="padding: 32px 40px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 15px; line-height: 20px; color: #555555;">
									<!-- Button : BEGIN -->
									<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
										<tr>
											<td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td">
												<a href="{keepaliveUrl}" style="background: #222222; border: 15px solid #222222; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 13px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
													<span style="color:#ffffff;" class="button-link">[[email:account-retention.button.keepalive]] &rarr;</span>
												</a>
											</td>
										</tr>
									</table>
									<!-- Button : END -->
								</td>
							</tr>
							<tr>
								<td style="padding: 0 40px 40px 40px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; font-size: 13px; line-height: 18px; color: #888888;">
									<p style="margin: 0 0 8px 0;">[[email:account-retention.final-warning.alt, {base_url}]]</p>
									<p style="margin: 0;">[[email:account-retention.footer.legal]]</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<!-- 1 Column Text + Button : END -->
			</table>
			<!-- Email Body : END -->

			<!-- Email Footer : BEGIN -->
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px;">
				<tr>
					<td style="padding: 40px 10px; width: 100%; font-size: 12px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; line-height: 18px; text-align: center; color: #888888;">
						<br><br>
						{{{ if showUnsubscribe }}}
						[[email:notif.post.unsub.info]] <a href="{url}/uid/{uid}/settings">[[email:unsub.cta]]</a>.
						<br />[[email:notif.post.unsub.one-click]] <a href="{unsubUrl}">[[email:unsubscribe]]</a>.
						{{{ end }}}
						<br><br>
					</td>
				</tr>
			</table>
			<!-- Email Footer : END -->

			<!--[if mso]>
			</td>
			</tr>
			</table>
			<![endif]-->
		</div>

	</center>
</body>
</html>
