import React from "react"
import { PlatformLayout } from '@/components/platform-layout';

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return <PlatformLayout>{children}</PlatformLayout>;
}
