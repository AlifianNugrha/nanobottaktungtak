import React from "react"
import { ProLayout } from '@/components/pro-layout';

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return <ProLayout>{children}</ProLayout>;
}
