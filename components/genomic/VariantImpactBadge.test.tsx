import { render, screen } from "@testing-library/react";
import { VariantImpactBadge } from "./VariantImpactBadge";

describe("VariantImpactBadge", () => {
  it("renders Pathogenic label for pathogenic significance", () => {
    render(<VariantImpactBadge significance="pathogenic" />);
    expect(screen.getByText("Pathogenic")).toBeInTheDocument();
  });

  it("renders VUS label for variant of uncertain significance", () => {
    render(<VariantImpactBadge significance="vus" />);
    expect(screen.getByText("VUS")).toBeInTheDocument();
  });

  it("renders Benign label for benign significance", () => {
    render(<VariantImpactBadge significance="benign" />);
    expect(screen.getByText("Benign")).toBeInTheDocument();
  });

  it("renders Drug response label for drug_response significance", () => {
    render(<VariantImpactBadge significance="drug_response" />);
    expect(screen.getByText("Drug response")).toBeInTheDocument();
  });

  it("renders Other when significance is undefined", () => {
    render(<VariantImpactBadge significance={undefined} />);
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <VariantImpactBadge significance="pathogenic" className="custom-class" />
    );
    const badge = container.querySelector(".custom-class");
    expect(badge).toBeInTheDocument();
  });
});
