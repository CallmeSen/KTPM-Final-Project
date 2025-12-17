'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost:8000/graphql" }),
    cache: new InMemoryCache(),
});

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ApolloProvider client={client}>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </ApolloProvider>
    );
}
