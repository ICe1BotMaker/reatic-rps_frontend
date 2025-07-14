import os
import sys
from PIL import Image, ImageSequence
import argparse

def compress_gif(input_path, output_path, quality=85, resize_factor=1.0, optimize=True, reduce_colors=256):
    """
    GIF 파일을 압축하는 함수
    
    Args:
        input_path (str): 입력 GIF 파일 경로
        output_path (str): 출력 GIF 파일 경로
        quality (int): 품질 설정 (1-100)
        resize_factor (float): 크기 조정 비율 (1.0 = 원본 크기)
        optimize (bool): 최적화 적용 여부
        reduce_colors (int): 색상 수 감소 (최대 256)
    """
    
    try:
        # GIF 파일 열기
        with Image.open(input_path) as img:
            if not img.is_animated:
                print("정적 이미지입니다. 단일 프레임으로 처리합니다.")
            
            frames = []
            durations = []
            
            # 각 프레임 처리
            for frame in ImageSequence.Iterator(img):
                # RGB로 변환 (투명도 제거)
                frame = frame.convert('RGB')
                
                # 크기 조정
                if resize_factor != 1.0:
                    new_width = int(frame.width * resize_factor)
                    new_height = int(frame.height * resize_factor)
                    frame = frame.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # 색상 수 감소 (팔레트 모드로 변환)
                if reduce_colors < 256:
                    frame = frame.quantize(colors=reduce_colors, method=Image.Quantize.MEDIANCUT)
                else:
                    frame = frame.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
                
                frames.append(frame)
                
                # 프레임 지속시간 저장
                duration = frame.info.get('duration', 100)
                durations.append(duration)
            
            # 압축된 GIF 저장
            if frames:
                frames[0].save(
                    output_path,
                    save_all=True,
                    append_images=frames[1:],
                    duration=durations,
                    loop=0,
                    optimize=optimize,
                    quality=quality
                )
                
                return True
            else:
                print("프레임을 찾을 수 없습니다.")
                return False
                
    except Exception as e:
        print(f"오류 발생: {e}")
        return False

def get_file_size(file_path):
    """파일 크기를 MB 단위로 반환"""
    size_bytes = os.path.getsize(file_path)
    size_mb = size_bytes / (1024 * 1024)
    return size_mb

def main():
    parser = argparse.ArgumentParser(description='GIF 파일 압축 프로그램')
    parser.add_argument('input', help='입력 GIF 파일 경로')
    parser.add_argument('-o', '--output', help='출력 파일 경로 (기본값: 입력파일명_compressed.gif)')
    parser.add_argument('-q', '--quality', type=int, default=1, help='품질 설정 (1-100, 기본값: 85)')
    parser.add_argument('-r', '--resize', type=float, default=.5, help='크기 조정 비율 (기본값: 1.0)')
    parser.add_argument('-c', '--colors', type=int, default=128, help='색상 수 (최대 256, 기본값: 256)')
    parser.add_argument('--no-optimize', action='store_true', help='최적화 비활성화')
    
    args = parser.parse_args()
    
    # 입력 파일 확인
    if not os.path.exists(args.input):
        print(f"입력 파일을 찾을 수 없습니다: {args.input}")
        sys.exit(1)
    
    # 출력 파일 경로 설정
    if args.output:
        output_path = args.output
    else:
        input_name = os.path.splitext(args.input)[0]
        output_path = f"{input_name}_compressed.gif"
    
    # 압축 전 파일 크기
    original_size = get_file_size(args.input)
    print(f"원본 파일 크기: {original_size:.2f} MB")
    
    # 압축 실행
    print("GIF 압축 중...")
    success = compress_gif(
        args.input,
        output_path,
        quality=args.quality,
        resize_factor=args.resize,
        optimize=not args.no_optimize,
        reduce_colors=args.colors
    )
    
    if success:
        # 압축 후 파일 크기
        compressed_size = get_file_size(output_path)
        compression_ratio = (1 - compressed_size / original_size) * 100
        
        print(f"압축 완료!")
        print(f"압축된 파일: {output_path}")
        print(f"압축 후 크기: {compressed_size:.2f} MB")
        print(f"압축률: {compression_ratio:.1f}%")
    else:
        print("압축 실패!")
        sys.exit(1)

# 간단한 사용 예제
def example_usage():
    """사용 예제"""
    print("=== GIF 압축 프로그램 사용 예제 ===")
    print()
    print("기본 사용법:")
    print("  python gif_compressor.py input.gif")
    print()
    print("고급 옵션:")
    print("  python gif_compressor.py input.gif -o output.gif -q 70 -r 0.8 -c 128")
    print()
    print("옵션 설명:")
    print("  -o, --output    : 출력 파일 경로")
    print("  -q, --quality   : 품질 (1-100, 높을수록 고품질)")
    print("  -r, --resize    : 크기 조정 (0.5 = 50% 크기)")
    print("  -c, --colors    : 색상 수 (적을수록 더 압축)")
    print("  --no-optimize   : 최적화 비활성화")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        example_usage()
    else:
        main()