Deno.serve(async (req) => {
  // CORS Headers taake aap ise kisi bhi website se fetch kar sakein
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "X-Developer": "Ramzan Ahsan", // Custom Header Credit
  });

  // URL se query parameters nikalne ke liye
  const url = new URL(req.url);
  let number = url.searchParams.get("number");

  // Agar number missing ho
  if (!number) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Please provide a phone number. Example: ?number=03016478468",
        developer: "Ramzan Ahsan"
      }),
      { status: 400, headers }
    );
  }

  // Input validation aur format fixing (92 format)
  // Agar number 03xx se start ho raha hai to use 923xx me convert karein agar aap ki API ko requirement ho
  // Agar aap ki target API direct '03' accept karti hai, to is verification ko skip bhi kar sakte hain
  if (number.startsWith("+")) {
    number = number.replace("+", "");
  }
  if (number.startsWith("0")) {
    // Agar zero se start ho to aap use modify kar sakte hain, abhi hum directly pass kar rahe hain
  }

  // Target API URL
  const targetApiUrl = `https://fam-official.serv00.net/api/database.php?number=${number}`;

  try {
    // Target API ko request bhejna
    const response = await fetch(targetApiUrl);
    
    if (!response.ok) {
      throw new Error("Target server responded with an error");
    }

    const data = await response.json();

    // Final response format jo Ramzan Ahsan ke credit ke sath return hoga
    const finalResponse = {
      status: true,
      developer: "Ramzan Ahsan",
      results: data.results || data // Agar key 'results' hai to wo uthayega, nahi to pura data
    };

    return new Response(JSON.stringify(finalResponse, null, 2), {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        status: false,
        message: "Error fetching data from the main database.",
        error: error.message,
        developer: "Ramzan Ahsan"
      }),
      { status: 500, headers }
    );
  }
});
