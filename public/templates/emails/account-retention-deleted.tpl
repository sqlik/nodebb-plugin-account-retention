<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>{site_title}</title>
<style>
html,body{margin:0 auto !important;padding:0 !important;height:100% !important;width:100% !important;}
*{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;}
table{border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;}
img{-ms-interpolation-mode:bicubic;}
@media screen and (max-width:600px){.email-container p{font-size:17px !important;line-height:26px !important;}}
</style>
</head>
<body width="100%" bgcolor="#f6f6f6" style="margin:0;mso-line-height-rule:exactly;">
<center style="width:100%;background:#f6f6f6;text-align:left;">
<div style="max-width:600px;margin:auto;{{{ if rtl }}}text-align:right;direction:rtl;{{{ end }}}" class="email-container">

	<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:600px;">
		<tr>
			<td style="padding:20px 0;text-align:center">
				{{{ if logo.src }}}
				<img src="{logo.src}" height="auto" width="{logo.width}" alt="{site_title}" border="0" style="height:auto;width:{logo.width}px;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;color:#333;">
				{{{ else }}}
				&nbsp;
				{{{ end }}}
			</td>
		</tr>
	</table>

	<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:600px;">
		<tr>
			<td bgcolor="#ffffff">
				<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
					<tr>
						<td style="padding:40px 40px 24px 40px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#555;">
							<h1 style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;font-size:22px;line-height:27px;color:#333;font-weight:normal;">[[email:account-retention.greeting, {username}]]</h1>
							{{{ if daysInactive }}}
							<p style="margin:0 0 14px;">[[email:account-retention.deleted.intro-with-days, {site_title}, {daysInactive}]]</p>
							{{{ else }}}
							<p style="margin:0 0 14px;">[[email:account-retention.deleted.intro, {site_title}]]</p>
							{{{ end }}}
							<p style="margin:0;">[[email:account-retention.deleted.body]]</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>

	<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:680px;">
		<tr>
			<td style="padding:30px 10px;font-size:12px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;line-height:18px;text-align:center;color:#888;">
				[[email:account-retention.footer.legal]]
			</td>
		</tr>
	</table>

</div>
</center>
</body>
</html>
