import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEventHandler, useState } from "react";
import { toast } from "sonner";

interface NewNoteProps {
  onNoteCreated: (content: string) => void;
}

let SpeechRecognition: SpeechRecognition | null = null;

export function NewNote({ onNoteCreated }: NewNoteProps) {
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  function handleStartEditor() {
    setShouldShowOnBoarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
    if (event.target.value === "") {
      setShouldShowOnBoarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);
    setContent("");
    setShouldShowOnBoarding(true);
    toast.success("Nota criada com sucesso");
  }

  function handleStartRecording() {
    setIsRecording(true);
    setShouldShowOnBoarding(false);

    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("O seu navegador não suporta a API de gravação");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    //busca essa API no navegador
    SpeechRecognition = new SpeechRecognitionAPI();
    //atribui ela a uma variável
    SpeechRecognition.lang = "pt-BR";
    //informa que a lingua do SpeechRecognition será português
    SpeechRecognition.continuous = true;
    //informa ao meu APP para não parar a gravação se eu parar de falar
    SpeechRecognition.maxAlternatives = 1;
    //trás a alternativa 1 nas palavras dificeis
    SpeechRecognition.interimResults = true;
    //traga os resultados conforme eu vá falando
    SpeechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };
    //função a ser chamada sempre que a API de reconhecimento de fala ouvir algo

    SpeechRecognition.onerror = (event) => {
      console.error(event);
    };

    SpeechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
    if (SpeechRecognition != null) {
      SpeechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 hover:ring-2 outline-none hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed md:left-1/2 md:top-1/2 inset-0 md:inset-auto md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>
          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-200">
                Adicionar Nota
              </span>
              {shouldShowOnBoarding ? (
                <p className="text-sm leading-6 text-slate-300">
                  Comece{" "}
                  <button
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline"
                    type="button"
                  >
                    gravando uma nota
                  </button>{" "}
                  em áudio ou se preferir
                  <button
                    className="font-medium text-lime-400 hover:underline"
                    onClick={handleStartEditor}
                    type="button"
                  >
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type="button"
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                onClick={handleSaveNote}
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
