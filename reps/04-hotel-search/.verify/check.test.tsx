import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("14 hotels"), { timeout: 3000 });
}
function row(name: string) { return screen.getByText(name, { selector: "td" }).closest("tr")!; }

describe("rep 04: your fixes", () => {
  it("HTL-512 fixed: city and stars filters refetch and the count matches", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("City"), "Lisbon");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("5 hotels (Lisbon, any rating)"), { timeout: 3000 });
    expect(screen.queryByText("Aman Tokyo")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Minimum stars"), "5");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("2 hotels (Lisbon, 5+ stars)"), { timeout: 3000 });
  });
  it("HTL-516 fixed: amenities render as labels", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(row("Memmo Alfama"));
    await screen.findByRole("heading", { level: 2, name: "Memmo Alfama" }, {}, { timeout: 3000 });
    expect(screen.getByLabelText("Amenities")).toHaveTextContent("Pool, Rooftop bar");
  });
  it("HTL-519 fixed: the shortlist total adds up", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Shortlist Bairro Alto Hotel" }));
    await user.click(screen.getByRole("button", { name: "Shortlist Memmo Alfama" }));
    expect(screen.getByLabelText("Shortlist nightly total")).toHaveTextContent("$630.00");
    expect(within(screen.getByLabelText("Shortlist")).getByText("$240")).toBeInTheDocument();
  });
  it("the rest of the page still works and the effect doesn't storm", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search hotels"), "shinjuku");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("2 hotels"), { timeout: 3000 });
    const before = screen.getByLabelText("Result count").textContent;
    await new Promise((r) => setTimeout(r, 800));
    expect(screen.getByLabelText("Result count").textContent).toBe(before);
  });
});
