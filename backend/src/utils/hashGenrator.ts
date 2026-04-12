export function random(len: number) {
  let hasher = "wifhwfgwfn72384294722950jzpcscsoicfewfwpfikndvijov";
  let ans = "";
  let length = hasher.length;
  for (let i = 0; i < hasher.length; i++) {
    ans += hasher[Math.floor(Math.random() * length)];
  }
  return ans;
}
