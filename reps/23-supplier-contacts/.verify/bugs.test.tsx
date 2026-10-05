import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByRole("heading", { level: 1, name: /Bairro Alto Hotel/ }, { timeout: 3000 });
}
const events = () => Number(screen.getByLabelText("Events tracked").textContent!.match(/(\d+)/)![1]);

describe("rep 23: page works outside the planted bugs", () => {
  it("lists contacts, tracks edits as unsaved, and previews the primary", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByTestId("contact-12")).toBeInTheDocument();
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Up to date");
    expect(screen.getByLabelText("Primary preview")).toHaveTextContent("Ines Carvalho");
    await user.type(screen.getByLabelText("Phone Rui Santos"), "1");
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
    expect(screen.getByLabelText("Phone Rui Santos")).toHaveValue("+351 21 340 82901");
  });
});

describe("rep 23: the three planted bugs reproduce", () => {
  it("SCT-301: the events counter climbs while typing, and Save does nothing", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    const before = events();
    await user.type(screen.getByLabelText("Phone Rui Santos"), "123");
    expect(events()).toBeGreaterThanOrEqual(before + 3);
    await user.click(screen.getByLabelText("Save contacts"));
    await new Promise((r) => setTimeout(r, 600));
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
    expect(spy.mock.calls.some((call) => String(call[0]).includes("listener to be a function"))).toBe(true);
    spy.mockRestore();
  });
  it("SCT-305: the primary radio can't be changed", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Primary Rui Santos"));
    expect(screen.getByLabelText("Primary Rui Santos")).not.toBeChecked();
    expect(screen.getByLabelText("Primary Ines Carvalho")).toBeChecked();
    expect(screen.getByLabelText("Primary preview")).toHaveTextContent("Ines Carvalho");
  });
  it("SCT-309: the preview ignores the phone you typed", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.clear(screen.getByLabelText("Phone Ines Carvalho"));
    await user.type(screen.getByLabelText("Phone Ines Carvalho"), "+351 21 000 0000");
    expect(screen.getByLabelText("Phone Ines Carvalho")).toHaveValue("+351 21 000 0000");
    expect(screen.getByLabelText("Preview phone")).toHaveTextContent("+351 21 340 8288");
  });
});
