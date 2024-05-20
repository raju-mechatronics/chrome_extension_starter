const hostURL = "http://localhost:4444";

export async function writeString(str: string, clear = false) {
  try {
    const response = await fetch(`${hostURL}/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: str, clear }),
    });
    return response.json();
  } catch (e) {
    const confirmed = confirm("Run the server first");
    if (confirmed) {
      return writeString(str);
    } else {
      return "Server not running";
    }
  }
}
