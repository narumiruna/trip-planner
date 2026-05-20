/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';

describe('Settings page', () => {
  it('focuses on the real password task instead of fake account pills', () => {
    render(<SettingsPage />);

    expect(screen.getByText('帳號設定')).toBeInTheDocument();
    expect(screen.getByText('修改你的密碼。')).toBeInTheDocument();
    expect(screen.queryByText('Private account control')).not.toBeInTheDocument();
    expect(screen.queryByText('旅程權限')).not.toBeInTheDocument();
    expect(screen.queryByText('分享控管')).not.toBeInTheDocument();
    expect(screen.queryByText(/共編權限/)).not.toBeInTheDocument();
  });
});
