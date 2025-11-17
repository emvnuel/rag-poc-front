import { FileUp, FileText, Globe } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentUploadZone } from './DocumentUploadZone'
import { TextUploadForm } from './TextUploadForm'
import { WebsiteUploadForm } from './WebsiteUploadForm'

interface UploadTabsProps {
  projectId: string
}

/**
 * Tabbed interface combining file, text, and website upload methods
 */
export function UploadTabs({ projectId }: UploadTabsProps) {
  return (
    <Tabs defaultValue="file" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="file" className="flex items-center gap-1 md:gap-2 px-2 md:px-3">
          <FileUp className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">File Upload</span>
          <span className="sm:hidden">File</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-1 md:gap-2 px-2 md:px-3">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span>Text</span>
        </TabsTrigger>
        <TabsTrigger value="website" className="flex items-center gap-1 md:gap-2 px-2 md:px-3">
          <Globe className="h-4 w-4 flex-shrink-0" />
          <span className="hidden xs:inline">Website</span>
          <span className="xs:hidden">Web</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="file" className="mt-3 md:mt-4">
        <DocumentUploadZone projectId={projectId} />
      </TabsContent>

      <TabsContent value="text" className="mt-3 md:mt-4">
        <TextUploadForm projectId={projectId} />
      </TabsContent>

      <TabsContent value="website" className="mt-3 md:mt-4">
        <WebsiteUploadForm projectId={projectId} />
      </TabsContent>
    </Tabs>
  )
}
