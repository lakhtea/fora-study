import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Rate count")).toHaveTextContent("5,040 rates"), { timeout: 5000 });
}

describe("app 04 acceptance", () => {
  it("renders a windowed table, not 5,040 rows", async () => {
    await loadPage();
    const viewport = screen.getByLabelText("Rates viewport");
    expect(within(viewport).getAllByRole("row").length).toBeLessThanOrEqual(61);
    expect(within(viewport).getAllByRole("row").length).toBeGreaterThan(5);
  });
  it("filters with the deferred value and updates the count", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Filter rates"), "Aman");
    expect(screen.getByLabelText("Filter rates")).toHaveValue("Aman");
    await waitFor(() => expect(screen.getByLabelText("Rate count")).toHaveTextContent("315 rates"), { timeout: 4000 });
  });
  it("toggles reviewed without re-rendering other rows", async () => {
    const user = userEvent.setup();
    await loadPage();
    const viewport = screen.getByLabelText("Rates viewport");
    const rows = within(viewport).getAllByRole("row").filter((r) => r.querySelector("input[type=checkbox]"));
    const target = rows[0].querySelector("input[type=checkbox]") as HTMLInputElement;
    const other = rows[3];
    const before = other.getAttribute("data-renders");
    await user.click(target);
    expect(target).toBeChecked();
    expect(screen.getByLabelText("Reviewed count")).toHaveTextContent("Reviewed: 1");
    expect(other.getAttribute("data-renders")).toBe(before);
  });
  it("sorts by nightly and flips", async () => {
    const user = userEvent.setup();
    await loadPage();
    const header = screen.getByRole("button", { name: /^Nightly/ });
    await user.click(header);
    const viewport = screen.getByLabelText("Rates viewport");
    const first = within(viewport).getAllByRole("row").find((r) => r.querySelector("td"))!.textContent!;
    await user.click(header);
    const flipped = within(viewport).getAllByRole("row").find((r) => r.querySelector("td"))!.textContent!;
    expect(first).not.toEqual(flipped);
  });
  it("scrolling the viewport mounts different rows", async () => {
    await loadPage();
    const viewport = screen.getByLabelText("Rates viewport");
    const firstBefore = within(viewport).getAllByRole("row").find((r) => r.querySelector("td"))!.textContent;
    fireEvent.scroll(viewport, { target: { scrollTop: 20000 } });
    await waitFor(() => {
      const firstAfter = within(viewport).getAllByRole("row").find((r) => r.querySelector("td"))!.textContent;
      expect(firstAfter).not.toEqual(firstBefore);
    }, { timeout: 4000 });
  });
});
