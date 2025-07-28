#!/usr/bin/env python3
"""
PNG to GIF Converter - 수정된 버전
여러 PNG 파일을 하나의 GIF 애니메이션으로 변환하는 프로그램
"""

import os
import sys
from PIL import Image
import argparse
import glob
import re

def natural_sort_key(text):
    """자연스러운 정렬을 위한 키 함수"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', text)]

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
    
    # 중복 제거
    png_files = list(set(png_files))
    
    if not png_files:
        print(f"❌ '{input_folder}' 폴더에 PNG 파일이 없습니다.")
        return False
    
    # 자연스러운 정렬 (1.png, 2.png, 10.png 순서로)
    png_files.sort(key=lambda x: natural_sort_key(os.path.basename(x)))
    
    print(f"📁 발견된 PNG 파일: {len(png_files)}개")
    for i, file in enumerate(png_files[:5]):  # 처음 5개만 출력
        print(f"   {i+1}. {os.path.basename(file)}")
    if len(png_files) > 5:
        print(f"   ... 및 {len(png_files)-5}개 더")
    
    # 이미지 로드 및 처리
    images = []
    has_transparency = False
    
    for i, png_file in enumerate(png_files):
        try:
            img = Image.open(png_file)
            original_mode = img.mode
            
            # 투명도 확인 및 처리
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                has_transparency = True
                
                # RGBA 모드 처리
                if img.mode == 'RGBA':
                    # 투명도 정보 보존을 위해 팔레트 모드로 변환
                    # 투명한 픽셀을 특정 색상으로 대체하여 투명도 인덱스 생성
                    img_with_transparency = img.convert('P', palette=Image.ADAPTIVE, colors=255)
                    
                    # 투명도 마스크 생성
                    alpha = img.getchannel('A')
                    
                    # 투명한 픽셀들을 255번 인덱스로 설정
                    transparency_mask = alpha.point(lambda x: 255 if x < 128 else 0, mode='1')
                    img_with_transparency.paste(255, transparency_mask)
                    
                    # 투명도 정보 설정
                    img_with_transparency.info['transparency'] = 255
                    img = img_with_transparency
                    
                elif img.mode == 'P' and 'transparency' in img.info:
                    # 이미 P 모드이고 투명도가 있는 경우 그대로 유지
                    pass
                else:
                    # 다른 투명도 모드는 RGBA로 변환 후 처리
                    img = img.convert('RGBA')
                    img_with_transparency = img.convert('P', palette=Image.ADAPTIVE, colors=255)
                    alpha = img.getchannel('A')
                    transparency_mask = alpha.point(lambda x: 255 if x < 128 else 0, mode='1')
                    img_with_transparency.paste(255, transparency_mask)
                    img_with_transparency.info['transparency'] = 255
                    img = img_with_transparency
            else:
                # 투명도가 없는 경우
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                # RGB를 P 모드로 변환 (GIF 최적화)
                img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
            
            # 리사이즈
            if resize:
                img = img.resize(resize, Image.Resampling.LANCZOS)
            
            images.append(img)
            print(f"✅ 로드됨: {os.path.basename(png_file)} ({original_mode} → {img.mode}) [{i+1}/{len(png_files)}]")
            
        except Exception as e:
            print(f"❌ 오류 - {png_file}: {e}")
            continue
    
    if not images:
        print("❌ 유효한 이미지가 없습니다.")
        return False
    
    # 모든 이미지의 크기를 첫 번째 이미지와 동일하게 맞춤
    if len(images) > 1:
        target_size = images[0].size
        for i in range(1, len(images)):
            if images[i].size != target_size:
                images[i] = images[i].resize(target_size, Image.Resampling.LANCZOS)
    
    # GIF 저장
    try:
        print(f"\n🎬 GIF 생성 중...")
        print(f"   - 투명도: {'있음' if has_transparency else '없음'}")
        print(f"   - 프레임 지속시간: {duration}ms")
        print(f"   - 반복: {'무한' if loop == 0 else f'{loop}회'}")
        
        # 첫 번째 이미지를 기준으로 저장
        first_image = images[0]
        
        # 저장 옵션 설정
        save_kwargs = {
            'format': 'GIF',
            'save_all': True,
            'append_images': images[1:],
            'duration': duration,
            'loop': loop,
            'optimize': False,  # optimize를 False로 설정해 duration 문제 해결
            'disposal': 2  # 이전 프레임 지우기
        }
        
        # 투명도가 있는 경우 투명도 정보 추가
        if has_transparency:
            save_kwargs['transparency'] = 255
        
        # 저장 실행
        try:
            first_image.save(output_file, **save_kwargs)
        except (TypeError, OSError) as e:
            # disposal 옵션이 지원되지 않는 경우 또는 다른 오류 발생 시
            print(f"   ⚠️  일부 옵션이 지원되지 않아 기본 설정으로 저장합니다: {e}")
            
            # 기본 옵션으로 재시도
            basic_kwargs = {
                'format': 'GIF',
                'save_all': True,
                'append_images': images[1:],
                'duration': duration,
                'loop': loop
            }
            
            if has_transparency:
                basic_kwargs['transparency'] = 255
            
            first_image.save(output_file, **basic_kwargs)
        
        print(f"🎉 GIF 생성 완료: {output_file}")
        print(f"   - 프레임 수: {len(images)}")
        print(f"   - 지속 시간: {duration}ms")
        print(f"   - 반복: {'무한' if loop == 0 else f'{loop}회'}")
        
        # 파일 크기 확인
        file_size = os.path.getsize(output_file)
        print(f"   - 파일 크기: {file_size / (1024*1024):.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ GIF 저장 오류: {e}")
        import traceback
        traceback.print_exc()
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
  python png_to_gif.py 3dhands/1_mainloop 1_mainloop.gif --duration 100 --loop 0
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
    
    # 파라미터 확인 출력
    print(f"🔧 설정:")
    print(f"   - 입력 폴더: {args.input_folder}")
    print(f"   - 출력 파일: {args.output_file}")
    print(f"   - 지속 시간: {args.duration}ms")
    print(f"   - 반복: {'무한' if args.loop == 0 else f'{args.loop}회'}")
    if args.resize:
        print(f"   - 리사이즈: {args.resize[0]}x{args.resize[1]}")
    print()
    
    # 입력 폴더 확인
    if not os.path.exists(args.input_folder):
        print(f"❌ 입력 폴더가 존재하지 않습니다: {args.input_folder}")
        sys.exit(1)
    
    if not os.path.isdir(args.input_folder):
        print(f"❌ 입력 경로가 폴더가 아닙니다: {args.input_folder}")
        sys.exit(1)
    
    # 출력 폴더 생성
    output_dir = os.path.dirname(args.output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 출력 폴더 생성: {output_dir}")
    
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
