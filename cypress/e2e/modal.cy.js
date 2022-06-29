/// <reference types="cypress" />

context("Modals", () => {
  beforeEach(() => {
    cy.visit("");
  });
  it("should open and close the modal", () => {
    cy.get("[data-testid='section__img-15']").click();
    cy.get("[class='modal__close']").find("span").click();
  });
  it("should open the modal and change carousel image", () => {
    cy.get("[data-testid='section__img-15']").click();
    cy.get("[data-testid='carousel-img-16']").click();
    cy.get("[data-testid='modal__img-16']").should("be.visible");
  });
});
