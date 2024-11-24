import ChatTTS
import torch
import torchaudio
import unittest
import os
import uuid


class ChatttsTest(unittest.TestCase):
    def test_spk_generator(self):
        chat = ChatTTS.Chat()
        chat.load(compile=False, source="huggingface", force_redownload=True)

        text = """人猿相揖别。[uv_break]只几个石头磨过，[uv_break]小儿时节。
                 [uv_break]铜铁炉中翻火焰，[uv_break]为问何时猜得，[uv_break]不过几千寒热。
                 [uv_break]人世难逢开口笑，[uv_break]上疆场彼此弯弓月。[uv_break]流遍了，[uv_break]郊原血。
                 [uv_break]一篇读罢头飞雪，[uv_break]但记得斑斑点点，[uv_break]几行陈迹。
                 [uv_break]五帝三皇神圣事，[uv_break]骗了无涯过客。
                 [uv_break]有多少风流人物？[uv_break]盗跖庄蹻流誉后，[uv_break]更陈王奋起挥黄钺。
                 [uv_break]歌未竟，[uv_break]东方白。
                 """.replace('\n', '')
        test_id = str(uuid.uuid4())

        rand_spk = chat.sample_random_speaker()

        params_infer_code = ChatTTS.Chat.InferCodeParams(
            spk_emb=rand_spk,  # add sampled speaker
            temperature=.3,  # using custom temperature
            top_P=0.7,  # top P decode
            top_K=20,  # top K decode
        )

        params_refine_text = ChatTTS.Chat.RefineTextParams(
            prompt='[oral_2][laugh_0][break_4]',
        )

        wavs = chat.infer(
            text,
            skip_refine_text=True,
            params_refine_text=params_refine_text,
            params_infer_code=params_infer_code
        )
        filename = "test-" + test_id + ".wav"
        torchaudio.save(filename, torch.from_numpy(wavs), 24000)
        self.assertEqual(True, os.path.exists(filename))  # add assertion here


if __name__ == '__main__':
    unittest.main()
