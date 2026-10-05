import { Component, type ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() { return this.state.error ? <div data-testid="crash">{this.state.error}</div> : this.props.children; }
}

async function loadPage() {
  render(<Boundary><App /></Boundary>);
  await screen.findByRole("heading", { level: 2, name: "Maya Okafor" }, { timeout: 3000 });
}

describe("rep 06: page works outside the planted bugs", () => {
  it("loads Maya's settings and saves an edit", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Name")).toHaveValue("Maya Okafor");
    expect(screen.getByLabelText("newsletter")).toBeChecked();
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Up to date");
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Maya Okafor-Bello");
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(screen.getByLabelText("Save state")).toHaveTextContent(/Saved at/), { timeout: 3000 });
    expect(screen.getByRole("heading", { level: 2, name: "Maya Okafor-Bello" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Maya Okafor");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Maya Okafor" })).toBeInTheDocument(), { timeout: 3000 });
  });
  it("links and unlinks a traveler", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(within(screen.getByLabelText("Linked travelers")).getAllByRole("listitem")).toHaveLength(2);
    await user.selectOptions(screen.getByLabelText("Traveler to link"), "906");
    await user.click(screen.getByRole("button", { name: "Link" }));
    expect(within(screen.getByLabelText("Linked travelers")).getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Unlink Noah Reyes" }));
    expect(within(screen.getByLabelText("Linked travelers")).getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("rep 06: the three planted bugs reproduce", () => {
  it("SET-801: switching to Daniel keeps Maya's form and lights up Unsaved changes", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: /Daniel Reyes/ }));
    await screen.findByRole("heading", { level: 2, name: "Daniel Reyes" }, { timeout: 3000 });
    expect(screen.getByLabelText("Name")).toHaveValue("Maya Okafor");
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
  });
  it("SET-804: opening Hiro crashes the page", async () => {
    const user = userEvent.setup();
    await loadPage();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /Hiro Tanaka/ }));
    await screen.findByTestId("crash", {}, { timeout: 3000 });
    spy.mockRestore();
  });
  it("SET-807: a phone with parentheses leaves the form on Saving forever", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    await user.clear(screen.getByLabelText("Phone"));
    await user.type(screen.getByLabelText("Phone"), "(718) 555-0142");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Saving");
    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
    expect(screen.queryByText(/Phone may only contain/)).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
