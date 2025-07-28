import React from 'react';
import { render, screen } from '@testing-library/react';
import SkeletonLoader, {
    Skeleton,
    SkeletonText,
    SkeletonContentCard,
    SkeletonAdminList,
    SkeletonForm,
    SkeletonDetail,
    SkeletonGrid
} from './SkeletonLoader';

describe('SkeletonLoader', () => {
    it('renderiza SkeletonContentCard por padrão', () => {
        render(<SkeletonLoader />);
        expect(document.querySelector('.skeleton-content-card')).toBeInTheDocument();
    });

    it('renderiza SkeletonAdminList quando type="admin-list"', () => {
        render(<SkeletonLoader type="admin-list" items={2} />);
        expect(document.querySelectorAll('.skeleton-admin-item').length).toBe(2);
    });

    it('renderiza SkeletonForm quando type="form"', () => {
        render(<SkeletonLoader type="form" />);
        expect(document.querySelector('.skeleton-form')).toBeInTheDocument();
    });

    it('renderiza SkeletonDetail quando type="detail"', () => {
        render(<SkeletonLoader type="detail" />);
        expect(document.querySelector('.skeleton-detail')).toBeInTheDocument();
    });

    it('renderiza SkeletonGrid com colunas e itens customizados', () => {
        render(<SkeletonLoader type="grid" columns={2} items={4} />);
        expect(document.querySelector('.skeleton-grid')).toBeInTheDocument();
        expect(document.querySelectorAll('.skeleton-content-card').length).toBe(4);
    });

    it('renderiza SkeletonText com linhas customizadas', () => {
        render(<SkeletonLoader type="text" items={5} />);
        expect(document.querySelectorAll('.skeleton-text').length).toBeGreaterThanOrEqual(5);
    });
});

describe('Skeleton components', () => {
    it('Skeleton renderiza com width e height', () => {
        render(<Skeleton width="100px" height="20px" />);
        const el = document.querySelector('.skeleton');
        expect(el).toBeInTheDocument();
        expect(el).toHaveStyle({ width: '100px', height: '20px' });
    });

    it('SkeletonText renderiza múltiplas linhas', () => {
        render(<SkeletonText lines={4} />);
        expect(document.querySelectorAll('.skeleton-text').length).toBe(4);
    });

    it('SkeletonContentCard renderiza estrutura de card', () => {
        render(<SkeletonContentCard />);
        expect(document.querySelector('.skeleton-content-card')).toBeInTheDocument();
    });

    it('SkeletonAdminList renderiza múltiplos itens', () => {
        render(<SkeletonAdminList items={3} />);
        expect(document.querySelectorAll('.skeleton-admin-item').length).toBe(3);
    });

    it('SkeletonForm renderiza campos de formulário', () => {
        render(<SkeletonForm />);
        expect(document.querySelector('.skeleton-form')).toBeInTheDocument();
    });

    it('SkeletonDetail renderiza detalhes', () => {
        render(<SkeletonDetail />);
        expect(document.querySelector('.skeleton-detail')).toBeInTheDocument();
    });

    it('SkeletonGrid renderiza grid de cards', () => {
        render(<SkeletonGrid columns={2} items={3} />);
        expect(document.querySelector('.skeleton-grid')).toBeInTheDocument();
        expect(document.querySelectorAll('.skeleton-content-card').length).toBe(3);
    });
});
