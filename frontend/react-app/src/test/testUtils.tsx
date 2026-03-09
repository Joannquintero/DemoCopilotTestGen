import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

/**
 * Crea un QueryClient configurado para pruebas.
 * - Sin reintentos para que los errores se propaguen inmediatamente.
 * - Sin GC time para evitar advertencias en tests.
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperOptions {
  /** Rutas iniciales para MemoryRouter */
  initialEntries?: MemoryRouterProps['initialEntries'];
  /** QueryClient personalizado (opcional) */
  queryClient?: QueryClient;
}

/**
 * Crea un componente wrapper que provee QueryClientProvider y MemoryRouter.
 * Necesario para renderizar componentes que usan React Query y React Router.
 */
const createWrapper = (options: WrapperOptions = {}) => {
  const {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
  } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );

  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

/**
 * Función de renderizado personalizada que envuelve el componente
 * en los providers necesarios (QueryClient + Router).
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & WrapperOptions
) => {
  const { initialEntries, queryClient, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper({ initialEntries, queryClient }),
    ...renderOptions,
  });
};

export { createWrapper };
