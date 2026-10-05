import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("14 hotels"), { timeout: 3000 });
}
function row(name: string) { return screen.getByText(name, { selector: "td" }).closest("tr")!; }

describe("rep 04: page works outside the planted bugs", () => {
  it("searches by text after a pause and selects a hotel", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search hotels"), "shinjuku");
    await waitFor(() => expect(screen.getByLabelText("Result count")).toHaveTextContent("2 hotels"), { timeout: 3000 });
    await user.click(row("Park Hyatt Tokyo"));
    expect(await screen.findByRole("heading", { level: 2, name: "Park Hyatt Tokyo" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/The New York Bar/)).toBeInTheDocument();
    expect(row("Park Hyatt Tokyo")).toHaveClass("selected");
  });
  it("shortlists one hotel with the right nightly total", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Shortlist Bairro Alto Hotel" }));
    expect(within(screen.getByLabelText("Shortlist")).getByText("Bairro Alto Hotel")).toBeInTheDocument();
    expect(screen.getByLabelText("Shortlist nightly total")).toHaveTextContent("$390.00");
    await user.click(screen.getByRole("button", { name: "Drop Bairro Alto Hotel" }));
    expect(screen.queryByLabelText("Shortlist")).not.toBeInTheDocument();
  });
});

describe("rep 04: the three planted bugs reproduce", () => {
  it("HTL-512: changing the city doesn't change the results, but the label says it did", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("City"), "Lisbon");
    await new Promise((r) => setTimeout(r, 700));
    expect(screen.getByLabelText("Result count")).toHaveTextContent("14 hotels (Lisbon, any rating)");
    expect(row("Aman Tokyo")).toBeInTheDocument();
  });
  it("HTL-516: amenities render as [object Object]", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(row("Memmo Alfama"));
    await screen.findByRole("heading", { level: 2, name: "Memmo Alfama" }, {}, { timeout: 3000 });
    expect(screen.getByLabelText("Amenities")).toHaveTextContent("[object Object], [object Object]");
  });
  it("HTL-519: shortlisting a second hotel turns the total into $NaN", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Shortlist Bairro Alto Hotel" }));
    expect(screen.getByLabelText("Shortlist nightly total")).toHaveTextContent("$390.00");
    await user.click(screen.getByRole("button", { name: "Shortlist Memmo Alfama" }));
    expect(screen.getByLabelText("Shortlist nightly total")).toHaveTextContent("$NaN");
    expect(within(screen.getByLabelText("Shortlist")).getByText("$240")).toBeInTheDocument();
  });
});
