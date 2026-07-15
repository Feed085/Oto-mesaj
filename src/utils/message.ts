export function generateMessage(
  template: string,
  companyName: string
): string {
  return template.replace(/\{ad\}/g, companyName);
}

export function generateAllMessages(
  template: string,
  companies: Array<{ id: string; name: string }>
): Array<{ id: string; message: string }> {
  return companies.map((c) => ({
    id: c.id,
    message: generateMessage(template, c.name),
  }));
}
