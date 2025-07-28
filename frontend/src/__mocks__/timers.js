// __mocks__/timers.js
// Use este mock apenas em testes que realmente precisam bloquear timers globais.
export function mockGlobalTimers() {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn, t) => 0);
    jest.spyOn(global, 'setInterval').mockImplementation((fn, t) => 0);
    jest.spyOn(global, 'clearTimeout').mockImplementation((id) => { });
    jest.spyOn(global, 'clearInterval').mockImplementation((id) => { });
}
export function restoreGlobalTimers() {
    jest.restoreAllMocks();
}
