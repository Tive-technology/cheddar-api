type MakeAuthHeaderProps = {
  username: string;
  password: string;
};
export function makeAuthHeader({
  username,
  password,
}: MakeAuthHeaderProps): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}
