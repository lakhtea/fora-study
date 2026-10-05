import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("8 active deals", {}, { timeout: 3000 });
}
const featured = () => within(screen.getByLabelText("Featured deals")).getAllByRole("listitem").map((li) => li.textContent?.split(" ")[0]);
const cardOrder = () => Array.from(document.querySelectorAll("[data-testid^='deal-']")).map((n) => n.getAttribute("data-testid"));

describe("rep 11: page works outside the planted bugs", () => {
  it("lists deals, features the first three, filters by category, and fills the tray", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(featured()).toEqual(["Four", "Belmond", "Silversea"]);
    await user.selectOptions(screen.getByLabelText("Category"), "cruise");
    expect(cardOrder()).toEqual(["deal-3", "deal-7"]);
    await user.selectOptions(screen.getByLabelText("Category"), "all");
    await user.click(screen.getByRole("button", { name: "Add Aman Kyoto" }));
    expect(within(screen.getByLabelText("Tray list")).getByText("Aman Kyoto")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Drop Aman Kyoto" }));
    expect(screen.queryByLabelText("Tray list")).not.toBeInTheDocument();
  });
});

describe("rep 11: the three planted bugs reproduce", () => {
  it("DLS-220: the tray badge is always one behind", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Add Aman Kyoto" }));
    expect(screen.getByText(/Tray for the Castellanos \(1\)/)).toBeInTheDocument();
    expect(screen.getByLabelText("Tray badge")).toHaveTextContent("Tray: 0");
    await user.click(screen.getByRole("button", { name: "Add Silversea" }));
    expect(screen.getByText(/Tray for the Castellanos \(2\)/)).toBeInTheDocument();
    expect(screen.getByLabelText("Tray badge")).toHaveTextContent("Tray: 1");
  });
  it("DLS-224: validity reads [object Object]", async () => {
    await loadPage();
    expect(screen.getByLabelText("Validity Four Seasons Lisbon")).toHaveTextContent("Valid until [object Object]");
  });
  it("DLS-229: sorting by discount rearranges the featured strip and can't be undone", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Sort by discount"));
    expect(cardOrder()[0]).toBe("deal-8");
    expect(featured()).toEqual(["Tsukiji", "Singita", "Four"]);
    await user.click(screen.getByLabelText("Sort by discount"));
    expect(cardOrder()[0]).toBe("deal-8");
    expect(featured()).toEqual(["Tsukiji", "Singita", "Four"]);
  });
});
