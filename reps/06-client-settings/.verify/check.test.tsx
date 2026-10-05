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

describe("rep 06: your fixes", () => {
  it("SET-801 fixed: switching clients shows that client's settings, clean", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: /Daniel Reyes/ }));
    await screen.findByRole("heading", { level: 2, name: "Daniel Reyes" }, { timeout: 3000 });
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Daniel Reyes"));
    expect(screen.getByLabelText("whatsapp")).toBeChecked();
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Up to date");
  });
  it("SET-804 fixed: Hiro's page renders and shows the archived traveler honestly", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: /Hiro Tanaka/ }));
    await screen.findByRole("heading", { level: 2, name: "Hiro Tanaka" }, { timeout: 3000 });
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Hiro Tanaka"));
    expect(screen.queryByTestId("crash")).not.toBeInTheDocument();
    const list = screen.getByLabelText("Linked travelers");
    expect(within(list).getByText("Yuki Tanaka")).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/Linked travelers \(2\)/)).toBeInTheDocument();
    expect(screen.getByLabelText("Household")).toHaveTextContent("Yuki Tanaka");
    expect(screen.getByLabelText("Household")).toHaveTextContent(/Archived/);
  });
  it("SET-807 fixed: a rejected save shows the server's message and recovers", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.clear(screen.getByLabelText("Phone"));
    await user.type(screen.getByLabelText("Phone"), "(718) 555-0142");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText(/Phone may only contain/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    expect(screen.getByLabelText("Phone")).toHaveValue("(718) 555-0142");
    expect(screen.getByLabelText("Save state")).toHaveTextContent("Unsaved changes");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Maya Okafor-Bello");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(screen.getByLabelText("Save state")).toHaveTextContent(/Saved at/), { timeout: 3000 });
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Maya Okafor");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Maya Okafor" })).toBeInTheDocument(), { timeout: 3000 });
  });
});
