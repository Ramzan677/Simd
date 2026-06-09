Deno.serve(async (req) => {
  // CORS Headers lagaye hain taake kisi bhi frontend se query karne par block na ho
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Developer": "Ramzan Ahsan",
  });

  // Handle preflight OPTIONS requests for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  let query = url.searchParams.get("number") || url.searchParams.get("query");

  if (!query) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Please provide a valid Number or CNIC. Example: ?number=03016478468",
        developer: "Ramzan Ahsan"
      }),
      { status: 400, headers }
    );
  }

  // Pure digits filter karein (space, hyphens ya '+' symbols ko khatam karne ke liye)
  let cleanInput = query.replace(/\D/g, "");

  // INPUT FORMAT LOGIC FOR PAKISTANI NUMBERS AND CNIC
  let formattedInput = cleanInput;

  if (cleanInput.length === 13) {
    // Agar input 13 digits ka hai, to yeh CNIC hai. Isko direct pass karein multi-data ke liye.
    formattedInput = cleanInput;
  } else {
    // Agar mobile number hai to use standard zero-prefix format me convert karein
    if (cleanInput.startsWith("92") && cleanInput.length > 10) {
      formattedInput = "0" + cleanInput.slice(2); // 92301... -> 0301...
    } else if (cleanInput.startsWith("3") && cleanInput.length === 10) {
      formattedInput = "0" + cleanInput; // 301... -> 0301...
    } else if (cleanInput.startsWith("03") && cleanInput.length === 11) {
      formattedInput = cleanInput; // Already safe 0301...
    }
  }

  // Base Server Target API URL
  const targetApiUrl = `https://fam-official.serv00.net/api/database.php?number=${formattedInput}`;

  try {
    const response = await fetch(targetApiUrl);
    if (!response.ok) throw new Error("Target API server connection failed");

    const rawData = await response.json();

    // Check successful response from backend status
    const isSuccess = rawData.success === true || (rawData.results && rawData.results.success === true);
    
    // Extracted records from nested layers safely
    const records = rawData.results?.data?.records || rawData.data?.records || [];

    // Response structure with Developer signature and zero nested junk
    const finalResponse = {
      status: isSuccess && records.length > 0,
      developer: "Ramzan Ahsan",
      query_type: cleanInput.length === 13 ? "CNIC" : "Mobile Number",
      results: records.length > 0 ? records : []
    };

    return new Response(JSON.stringify(finalResponse, null, 2), {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Internal server error while processing request.",
        developer: "Ramzan Ahsan"
      }),
      { status: 500, headers }
    );
  }
});
