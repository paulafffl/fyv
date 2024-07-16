/// <reference types="cypress" />

context('Modals', () => {
    beforeEach(() => {
        cy.visit('');
    });
    it('should open and close the modal', () => {
        cy.get("[data-cy='section__img-11']").click();
        cy.get("[data-cy='Close']").click({ force: true });
    });
    it('should open the modal and change carousel image', () => {
        cy.get("[data-cy='section__img-11']").click();
        cy.get("[data-cy='Next']").click();
        cy.get("[data-cy='modal__img-10']").should('be.visible');
        cy.get("[data-cy='Previous']").click();
        cy.get("[data-cy='modal__img-11']").should('be.visible');
    });
});
