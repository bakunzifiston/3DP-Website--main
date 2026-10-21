<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>3DP | Data Driven Decisions Partners</title>
    <meta
      name="description"
      content="3DP helps companies and individuals in Rwanda and East Africa become data driven through training, data products, data-driven systems, and strategy."
    />
    <meta name="theme-color" content="#132F45" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="3DP: Data Driven Decisions Partners" />
    <meta property="og:title" content="3DP | Data Driven Decisions Partners" />
    <meta property="og:description" content="Training, data products, data-driven systems and strategy for companies and individuals." />
    <meta property="og:image" content="{{ url('/icon-512.png') }}" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    @viteReactRefresh
    @vite('resources/js/main.jsx')
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <p style="padding: 24px; font-family: sans-serif">This website needs JavaScript enabled. You can reach 3DP at 3dp.rwanda@gmail.com.</p>
    </noscript>
  </body>
</html>
