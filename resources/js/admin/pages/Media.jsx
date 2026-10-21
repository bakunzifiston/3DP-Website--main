import { useState } from 'react';
import { usePageMeta } from '../../lib/hooks.js';
import { useToast } from '../Toast.jsx';
import { PageHeader } from '../ui.jsx';
import { MediaGrid, UploadDropzone } from '../components/MediaLibrary.jsx';

export default function Media() {
  usePageMeta('Admin · Media library');
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <PageHeader title="Media library" description="Images used across services, programs, articles and team profiles." />
      <UploadDropzone
        onUploaded={() => {
          toast('Image uploaded');
          setRefreshKey((k) => k + 1);
        }}
      />
      <div className="mt-6">
        <MediaGrid refreshKey={refreshKey} />
      </div>
    </>
  );
}
