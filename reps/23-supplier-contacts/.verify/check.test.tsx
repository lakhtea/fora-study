import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByRole("heading", { level: 1, name: /Bairro Alto Hotel/ }, { timeout: 3000 });
}
const events = () => Number(screen.getByLabelText("Events tracked").textContent!.match(/(\d+)/)![1]);

describe("rep 23: your fixes", () => {
  it("SCT-301 fixed: typing tracks nothing, Save tracks once and saves", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    const before = events();
    await user.type(screen.getByLabelText("Phone Rui Santos"), "1");
    expect(events()).toBe(before);
    await user.click(screen.getByLabelText("Save contacts"));
    await waitFor(() => expect(screen.getByLabelText("Save state")).toHaveTextContent(/Saved at/), { timeout: 3000 });
    expect(events()).toBe(before + 1);
    expect(screen.getByLabelText("Phone Rui Santos")).toHaveValue("+351 21 340 82901");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
  it("SCT-305 fixed: the primary radio changes and the preview follows", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByLabelText("Primary Rui Santos"));
    expect(screen.getByLabelText("Primary Rui Santos")).toBeChecked();
    expect(screen.getByLabelText("Primary preview")).toHaveTextContent("Rui Santos");
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
  });
  it("SCT-309 fixed: the preview shows edits, and they persist through Save", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.clear(screen.getByLabelText("Phone Ines Carvalho"));
    await user.type(screen.getByLabelText("Phone Ines Carvalho"), "+351 21 000 0000");
    expect(screen.getByLabelText("Preview phone")).toHaveTextContent("+351 21 000 0000");
    await user.click(screen.getByLabelText("Save contacts"));
    await waitFor(() => expect(screen.getByLabelText("Save state")).toHaveTextContent(/Saved at/), { timeout: 3000 });
    expect(screen.getByLabelText("Preview phone")).toHaveTextContent("+351 21 000 0000");
    expect(screen.getByLabelText("Phone Ines Carvalho")).toHaveValue("+351 21 000 0000");
  });
  it("the rest of the page still works", async () => {
    await loadPage();
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Up to date");
  });
});
