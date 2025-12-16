import { NavigationCRM } from "@/components/common/navigation/crm";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="pt-4 flex justify-center align-center">
        <NavigationCRM />
      </div>
      {children}
    </div>

  )
}
