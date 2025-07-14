#!/usr/bin/env python3
"""
PNG to GIF Converter
여러 PNG 파일을 하나의 GIF 애니메이션으로 변환하는 프로그램
"""

import os
import sys
from PIL import Image
import argparse
import glob

def convert_png_to_gif(input_folder, output_file, duration=500, loop=0, resize=None):
    """
    PNG 파일들을 GIF로 변환
    
    Args:
        input_folder (str): PNG 파일들이 있는 폴더 경로
        output_file (str): 출력 GIF 파일 경로
        duration (int): 각 프레임의 지속 시간 (밀리초)
        loop (int): 반복 횟수 (0 = 무한 반복)
        resize (tuple): 리사이즈할 크기 (width, height)
    """
    # PNG 파일 찾기
    png_files = glob.glob(os.path.join(input_folder, "*.png"))
    png_files.extend(glob.glob(os.path.join(input_folder, "*.PNG")))
    
    # 중복 제거 (대소문자 구분 안 하는 파일 시스템에서 발생할 수 있는 문제 해결)
    png_files = list(set(png_files))
    
    if not png_files:
        print(f"❌ '{input_folder}' 폴더에 PNG 파일이 없습니다.")
        return False
    
    # 파일명으로 정렬
    png_files.sort()
    
    print(f"📁 발견된 PNG 파일: {len(png_files)}개")
    
    # 이미지 로드
    images = []
    for i, png_file in enumerate(png_files):
        try:
            img = Image.open(png_file)
            
            # RGBA를 RGB로 변환 (GIF는 투명도 지원이 제한적)
            if img.mode == 'RGBA':
                # 흰색 배경으로 변환
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])  # 알파 채널을 마스크로 사용
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 리사이즈
            if resize:
                img = img.resize(resize, Image.Resampling.LANCZOS)
            
            images.append(img)
            print(f"✅ 로드됨: {os.path.basename(png_file)} ({i+1}/{len(png_files)})")
            
        except Exception as e:
            print(f"❌ 오류 - {png_file}: {e}")
            continue
    
    if not images:
        print("❌ 유효한 이미지가 없습니다.")
        return False
    
    # GIF 저장
    try:
        images[0].save(
            output_file,
            save_all=True,
            append_images=images[1:],
            duration=duration,
            loop=loop,
            optimize=True
        )
        print(f"🎉 GIF 생성 완료: {output_file}")
        print(f"   - 프레임 수: {len(images)}")
        print(f"   - 지속 시간: {duration}ms")
        print(f"   - 반복: {'무한' if loop == 0 else f'{loop}회'}")
        return True
        
    except Exception as e:
        print(f"❌ GIF 저장 오류: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="PNG 파일들을 GIF 애니메이션으로 변환",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python png_to_gif.py input_folder output.gif
  python png_to_gif.py images/ animation.gif --duration 200 --loop 3
  python png_to_gif.py frames/ result.gif --resize 800 600
        """
    )
    
    parser.add_argument('input_folder', help='PNG 파일들이 있는 폴더 경로')
    parser.add_argument('output_file', help='출력 GIF 파일 경로')
    parser.add_argument('--duration', type=int, default=500, 
                       help='각 프레임의 지속 시간 (밀리초, 기본값: 500)')
    parser.add_argument('--loop', type=int, default=0,
                       help='반복 횟수 (0 = 무한 반복, 기본값: 0)')
    parser.add_argument('--resize', nargs=2, type=int, metavar=('WIDTH', 'HEIGHT'),
                       help='이미지 리사이즈 크기 (예: --resize 800 600)')
    
    args = parser.parse_args()
    
    # 입력 폴더 확인
    if not os.path.exists(args.input_folder):
        print(f"❌ 입력 폴더가 존재하지 않습니다: {args.input_folder}")
        sys.exit(1)
    
    # 출력 폴더 생성
    output_dir = os.path.dirname(args.output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 리사이즈 옵션 처리
    resize = tuple(args.resize) if args.resize else None
    
    # 변환 실행
    success = convert_png_to_gif(
        input_folder=args.input_folder,
        output_file=args.output_file,
        duration=args.duration,
        loop=args.loop,
        resize=resize
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()