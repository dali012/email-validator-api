export const createApiKeySuccessPage = (
  apiKey: string,
  rateLimit: number,
  expiresAt: string
): string => {
  // Format expiration date in a more readable way
  const expirationDate = new Date(expiresAt);
  const formattedDate = expirationDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Key Generated Successfully</title>
    <link rel="icon" href="https://validator.dali012.me/favicon.ico" type="image/x-icon" sizes="16x16">
    <style>
        :root {
            --primary: #16A34A;
            --primary-dark: #15803d;
            --primary-light: #dcfce7;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-700: #374151;
            --gray-800: #1f2937;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--gray-800);
            background-color: #fafafa;
            line-height: 1.5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1.5rem;
        }
        
        .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            width: 100%;
            max-width: 720px;
            padding: 2.5rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .success-icon {
            background-color: var(--primary-light);
            color: var(--primary);
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
        }
        
        h2 {
            color: var(--gray-800);
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
        }
        
        .subtitle {
            color: var(--gray-700);
            font-size: 1.125rem;
        }
        
        .section {
            margin: 2rem 0;
        }
        
        h3 {
            color: var(--gray-800);
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .code-block {
            background-color: var(--gray-100);
            border-radius: 8px;
            padding: 1.25rem;
            font-family: 'SF Mono', 'Consolas', monospace;
            font-size: 0.9375rem;
            word-break: break-all;
            margin: 1rem 0;
            position: relative;
            border-left: 4px solid var(--primary);
        }
        
        .copy-button {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background-color: white;
            border: 1px solid var(--gray-200);
            border-radius: 4px;
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s ease;
        }
        
        .copy-button:hover {
            background-color: var(--gray-100);
        }
        
        .info-row {
            display: flex;
            align-items: center;
            padding: 1rem;
            background-color: var(--gray-100);
            border-radius: 8px;
            margin: 1rem 0;
        }
        
        .info-icon {
            margin-right: 1rem;
            color: var(--primary);
        }
        
        .info-content {
            flex: 1;
        }
        
        .info-label {
            font-size: 0.875rem;
            color: var(--gray-700);
            margin-bottom: 0.25rem;
        }
        
        .info-value {
            font-weight: 600;
        }
        
        .tip {
            background-color: var(--primary-light);
            border-radius: 8px;
            padding: 1.25rem;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .tip-icon {
            color: var(--primary);
            flex-shrink: 0;
        }
        
        .tip-content {
            flex: 1;
        }
        
        .tip-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 2.5rem;
            color: var(--gray-700);
            font-size: 0.875rem;
        }
        
        .footer-link {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
            </div>
            <h2>API Key Generated Successfully</h2>
            <p class="subtitle">Your new API key has been created and is ready to use</p>
        </div>
        
        <div class="section">
            <h3>Your API Key</h3>
            <p>Please store this securely. For security reasons, it won't be shown again:</p>
            <div class="code-block">
                <code>${apiKey}</code>
                <button class="copy-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                    Copy
                </button>
            </div>
        </div>
        
        <div class="section">
            <h3>Usage Instructions</h3>
            <p>Include your API key in the Authorization header of your requests:</p>
            <div class="code-block">
                <code>Authorization: Bearer ${apiKey}</code>
                <button class="copy-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                    Copy
                </button>
            </div>
            
            <div class="info-row">
                <div class="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                </div>
                <div class="info-content">
                    <div class="info-label">Rate Limit</div>
                    <div class="info-value">${rateLimit} requests per hour</div>
                </div>
            </div>
            
            <div class="info-row">
                <div class="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                </div>
                <div class="info-content">
                    <div class="info-label">Expiration Date</div>
                    <div class="info-value">${formattedDate}</div>
                </div>
            </div>
        </div>
        
        <div class="tip">
            <div class="tip-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
            </div>
            <div class="tip-content">
                <div class="tip-title">Security Tip</div>
                <p>Keep your API key secure. Never expose it in client-side code or commit it to public repositories. If you suspect your key has been compromised, regenerate it immediately from your dashboard.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact <a href="mailto:support@dali012.me" class="footer-link">support@dali012.me</a></p>
            <p style="margin-top: 0.5rem">Return to <a href="https://validator.dali012.me/" class="footer-link">API Dashboard</a></p>
            <div class="footer">
                © ${new Date().getFullYear()} Email Validator API
            </div>
        </div>
    </div>

    <script>
        // Simple copy functionality
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', () => {
                const codeBlock = button.closest('.code-block');
                const code = codeBlock.querySelector('code').textContent;
                
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = button.innerHTML;
                    button.textContent = 'Copied!';
                    
                    setTimeout(() => {
                        button.innerHTML = \`
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                            </svg>
                            Copy
                        \`;
                    }, 2000);
                });
            });
        });
    </script>
</body>
</html>`;
};
