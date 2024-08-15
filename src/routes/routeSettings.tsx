import SettingsView from "@/views/settings/SettingsView";
import SettingsWalletView from "@/views/settings/SettingsWalletView/SettingsWalletView";

export const routeSettings = [
  {
    path: "/settings",
    element: <SettingsView />,
  },
  {
    path: "/settings/wallet/:wallet_id",
    element: <SettingsWalletView />,
  },
  {
    path: "/settings/wallet/:wallet_id/additionalInformation",
    async lazy() {
      const { default: SettingsWalletAdditionalInformation } = await import(
        "@/views/settings/SettingsWalletAdditionalInformation/SettingsWalletAdditionalInformation"
      );
      return { Component: SettingsWalletAdditionalInformation };
    },
  },
  {
    path: "/settings/wallet/wizard",
    async lazy() {
      const { default: SettingsWalletWizard } = await import(
        "@/views/settings/SettingsWalletWizard/SettingsWalletWizard"
      );
      return { Component: SettingsWalletWizard };
    },
    children: [
      {
        index: true,
        async lazy() {
          const { default: SettingsWalletWizardInit } = await import(
            "@/views/settings/SettingsWalletWizardInit/SettingsWalletWizardInit"
          );
          return { Component: SettingsWalletWizardInit };
        },
      },
      {
        path: "import",
        async lazy() {
          const { default: SettingsWalletWizardImport } = await import(
            "@/views/settings/SettingsWalletWizardImport/SettingsWalletWizardImport"
          );
          return { Component: SettingsWalletWizardImport };
        },
      },
      {
        path: "import/build/:wallet_id",
        async lazy() {
          const { default: SettingsWalletWizardBuild } = await import(
            "@/views/settings/SettingsWalletWizardBuild/SettingsWalletWizardBuild"
          );
          return { Component: SettingsWalletWizardBuild };
        },
      },
    ],
  },
  {
    path: "/settings/wallet/:wallet_id/scan",
    async lazy() {
      const { default: SettingsWalletScanTool } = await import(
        "@/views/settings/SettingsWalletScanTool/SettingsWalletScanTool"
      );
      return { Component: SettingsWalletScanTool };
    },
  },
];
