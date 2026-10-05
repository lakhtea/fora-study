import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("8 active deals", {}, { timeout: 3000 });
}
const featured = () => within(screen.getByLabelText("Featured deals")).getAllByRole("listitem").map((li) => li.textContent?.split(" ")[0]);
const cardOrder = () => Array.from(document.querySelectorAll("[data-testid^='deal-']")).map((n) => n.getAttribute("data-testid"));

describe("rep 11: your fixes", () => {
  it("DLS-220 fixed: the badge matches the tray on every change", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Add Aman Kyoto" }));
    expect(screen.getByLabelText("Tray badge")).toHaveTextContent("Tray: 1");
    await user.click(screen.getByRole("button", { name: "Add Silversea" }));
    expect(screen.getByLabelText("Tray badge")).toHaveTextContent("Tray: 2");
    await user.click(screen.getByRole("button", { name: "Drop Aman Kyoto" }));
    expect(screen.getByLabelText("Tray badge")).toHaveTextContent("Tray: 1");
  });
  it("DLS-224 fixed: validity shows the date", async () => {
    await loadPage();
    expect(screen.getByLabelText("Validity Four Seasons Lisbon")).toHaveTextContent("Valid until 2026-11-30");
    expect(screen.getByLabelText("Validity Aman Kyoto")).toHaveTextContent("Valid until 2027-01-31");
  });
  it("DLS-229 fixed: sorting is a view, the featured strip and the original order survive", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Sort by discount"));
    expect(cardOrder()[0]).toBe("deal-8");
    expect(featured()).toEqual(["Four", "Belmond", "Silversea"]);
    await user.click(screen.getByLabelText("Sort by discount"));
    expect(cardOrder()).toEqual(["deal-1", "deal-2", "deal-3", "deal-4", "deal-5", "deal-6", "deal-7", "deal-8"]);
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Category"), "cruise");
    expect(cardOrder()).toEqual(["deal-3", "deal-7"]);
  });
});
