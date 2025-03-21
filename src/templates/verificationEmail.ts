export const createVerificationEmailTemplate = (
  verificationUrl: string,
  iconUrl: string = "https://validator.dali012.me/_next/image?url=%2Femail.png&w=48&q=75" // Default icon URL
): {
  text: string;
  html: string;
} => {
  const text = `Please verify your API key request by clicking this link: ${verificationUrl}. This link will expire in 30 minutes.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Validator API - Verify your request</title>
    <style>
        :root {
            --primary: #16A34A;
            --primary-dark: #15803d;
            --primary-hover: #22c55e;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-400: #9ca3af;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            color: var(--gray-700);
            background-color: #ffffff;
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1.5rem;
            text-align: center;
        }
        
        .container {
            max-width: 600px;
            width: 100%;
            padding: 20px;
        }
        
        .envelope-icon {
            margin-bottom: 1.5rem;
            width: 60px;
            height: 60px;
            opacity: 0.8;
        }
        
        h1 {
            color: var(--gray-800);
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        
        p {
            margin-bottom: 1.5rem;
            color: var(--gray-700);
        }
        
        .verify-button {
            display: inline-block;
            background-color: var(--primary);
            color: white;
            font-weight: 600;
            padding: 0.75rem 2rem;
            border-radius: 4px;
            text-decoration: none;
            margin: 1.5rem 0;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.2s;
        }
        
        .verify-button:hover {
            background-color: var(--primary-hover);
        }
        
        .expiry-text {
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .ignore-text {
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        
        .divider {
            height: 1px;
            background-color: var(--gray-200);
            margin: 2rem 0;
            width: 100%;
        }
        
        .footer {
            color: var(--gray-400);
            font-size: 0.8rem;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Envelope Icon -->
        <img src="${
          iconUrl ||
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI0IiB3aWR0aD0iMjAiIGhlaWdodD0iMTYiIHJ4PSIyIj48L3JlY3Q+PHBhdGggZD0iTTIyIDdMMTIgMTMgMiA3Ij48L3BhdGg+PC9zdmc+"
        }" alt="Email Validator API" class="envelope-icon">

        <h1>Email Validator API - Verify your request</h1>
        
        <p>Please verify your API key request by clicking the button below:</p>
        
        <a href="${verificationUrl}" class="verify-button">Verify Email</a>
        
        <p class="expiry-text">This link will expire in 30 minutes.</p>
        
        <p class="ignore-text">If you didn't request this API key, please ignore this email.</p>
        
        <div class="divider"></div>
        
        <div class="footer">
            © ${new Date().getFullYear()} Email Validator API
        </div>
    </div>
</body>
</html>`;

  return { text, html };
};
