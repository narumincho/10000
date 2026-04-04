const result = await Deno.bundle({
  entrypoints: ["./client/client.tsx"],
  minify: true,
});

if (result.errors.length > 0) {
  console.error(result.errors);
  throw new Error("build failed");
}

const clientCode = result.outputFiles?.[0]?.contents;
if (!clientCode) {
  throw new Error("client code not found");
}

await Deno.writeTextFile(
  "./dist.json",
  JSON.stringify({
    clientCode: new TextDecoder().decode(clientCode),
    clientHash: new Uint8Array(
      await crypto.subtle.digest("SHA-256", clientCode),
    ).toBase64({
      alphabet: "base64url",
      omitPadding: true,
    }),
  }),
);

console.log("build success");
