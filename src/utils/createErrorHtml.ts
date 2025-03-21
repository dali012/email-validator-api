export function createErrorHtml(message: string, status = 400) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://validator.dali012.me/favicon.ico" type="image/x-icon" sizes="16x16">
    <title>Email Validator API - Error</title>
    <style>
        :root {
            --primary: #16A34A;
            --primary-dark: #15803d;
            --primary-hover: #22c55e;
            --error: #ef4444;
            --error-dark: #dc2626;
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
        
        .error-icon {
            margin-bottom: 1.5rem;
            width: 60px;
            height: 60px;
            opacity: 0.8;
        }
        
        h1 {
            color: var(--error);
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        
        p {
            margin-bottom: 1.5rem;
            color: var(--gray-700);
        }
        
        .return-button {
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
        
        .return-button:hover {
            background-color: var(--primary-hover);
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
        <!-- Error Icon -->
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PGxpbmUgeDE9IjEyIiB5MT0iOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMTIiIHkxPSIxNiIgeDI9IjEyLjAxIiB5Mj0iMTYiPjwvbGluZT48L3N2Zz4=" alt="Error Icon" class="error-icon">

        <h1>Error</h1>
        
        <p>${message}</p>
        
        <a href="https://validator.dali012.me" class="return-button">Return to API Dashboard</a>
        
        <div class="divider"></div>
        
        <div class="footer">
            © ${new Date().getFullYear()} Email Validator API
        </div>
    </div>
</body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
