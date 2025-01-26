const generateAlias = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let aliases = "";

  for (let i = 0; i < 6; i++) {
    aliases += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  console.log("aliase: ", aliases);
  return aliases;
};

module.exports = { generateAlias };
