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

export function formatDateYYYY_MM_DD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
