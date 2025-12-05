/**
 * Dataset page - redirects to first record.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

import { redirect } from 'next/navigation';

interface DatasetPageProps {
  params: Promise<{ generator: string; dataset: string }>;
}

export default async function DatasetPage({
  params
}: DatasetPageProps): Promise<never> {
  const { generator, dataset } = await params;
  redirect(`/${generator}/${dataset}/0`);
}
