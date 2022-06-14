/// <reference types="cypress" />

context("Modals", () => {
  beforeEach(() => {
    cy.visit("");
  });
  it("should open and close the modal", () => {
    cy.get("[data-testid='grid-img-15']").click();
    cy.get("[class='modal-close']").find("span").click();
  });
  it("should open the modal and change carousel image", () => {
    cy.get("[data-testid='grid-img-15']").click();
    cy.get("[data-testid='carousel-img-16']").click();
    cy.get("[data-testid='modal-img-16']").should("be.visible");
  });
});
